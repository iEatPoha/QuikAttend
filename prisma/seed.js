// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashPassword = async (plain) => {
    return await bcrypt.hash(plain, 12)
  }

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@quikattend.com' },
    update: {
      name: 'System Admin',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
    create: {
      id: 'admin_001',
      name: 'System Admin',
      email: 'admin@quikattend.com',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  })

  // Teachers
  const teachers = [
    { id: 'teacher_001', name: 'Ravi Kumar', email: 'ravi.kumar@quikattend.com' },
    { id: 'teacher_002', name: 'Anita Sharma', email: 'anita.sharma@quikattend.com' },
    { id: 'teacher_003', name: 'Vikram Singh', email: 'vikram.singh@quikattend.com' },
  ]
  for (let t of teachers) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {
        name: t.name,
        password: await hashPassword('teacher123'),
        role: 'TEACHER',
      },
      create: {
        ...t,
        password: await hashPassword('teacher123'),
        role: 'TEACHER',
      },
    })
  }

  // Students
  const students = [
    { id: 'student_001', name: 'Amit Verma', email: 'amit.verma@student.com', year: '1st', branch: 'CSE' },
    { id: 'student_002', name: 'Priya Nair', email: 'priya.nair@student.com', year: '1st', branch: 'CSE' },
    { id: 'student_003', name: 'Rohit Mehta', email: 'rohit.mehta@student.com', year: '1st', branch: 'ME' },
    { id: 'student_004', name: 'Sneha Patel', email: 'sneha.patel@student.com', year: '2nd', branch: 'CSE' },
    { id: 'student_005', name: 'Arjun Reddy', email: 'arjun.reddy@student.com', year: '2nd', branch: 'CSE' },
    { id: 'student_006', name: 'Neha Gupta', email: 'neha.gupta@student.com', year: '2nd', branch: 'CSE' },
  ]
  for (let s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        year: s.year,
        branch: s.branch,
        password: await hashPassword('student123'),
        role: 'STUDENT',
      },
      create: {
        ...s,
        password: await hashPassword('student123'),
        role: 'STUDENT',
      },
    })
  }
}

main()
  .then(() => {
    console.log('✅ Database seeded with demo accounts (idempotent)')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
