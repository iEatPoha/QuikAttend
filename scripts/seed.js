const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quikattend.com' },
    update: {},
    create: {
      id: 'admin_001',
      name: 'System Administrator',
      email: 'admin@quikattend.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create sample teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'john.smith@quikattend.com' },
    update: {},
    create: {
      id: 'teacher_001',
      name: 'Dr. John Smith',
      email: 'john.smith@quikattend.com',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@quikattend.com' },
    update: {},
    create: {
      id: 'teacher_002',
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@quikattend.com',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  // Create sample students
  const student1 = await prisma.user.upsert({
    where: { email: 'alice.brown@student.com' },
    update: {},
    create: {
      id: 'student_001',
      name: 'Alice Brown',
      email: 'alice.brown@student.com',
      password: hashedPassword,
      role: 'STUDENT',
      year: '1st',
      branch: 'CSE',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'bob.wilson@student.com' },
    update: {},
    create: {
      id: 'student_002',
      name: 'Bob Wilson',
      email: 'bob.wilson@student.com',
      password: hashedPassword,
      role: 'STUDENT',
      year: '1st',
      branch: 'CSE',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'carol.davis@student.com' },
    update: {},
    create: {
      id: 'student_003',
      name: 'Carol Davis',
      email: 'carol.davis@student.com',
      password: hashedPassword,
      role: 'STUDENT',
      year: '1st',
      branch: 'ECE',
    },
  });

  // Create sample timeslots for CSE 1st year
  const timeslot1 = await prisma.timeslot.upsert({
    where: { 
      year_branch_dayOfWeek_startTime: {
        year: '1st',
        branch: 'CSE',
        dayOfWeek: 1,
        startTime: '09:00'
      }
    },
    update: {},
    create: {
      id: 'timeslot_001',
      year: '1st',
      branch: 'CSE',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const timeslot2 = await prisma.timeslot.upsert({
    where: { 
      year_branch_dayOfWeek_startTime: {
        year: '1st',
        branch: 'CSE',
        dayOfWeek: 1,
        startTime: '10:00'
      }
    },
    update: {},
    create: {
      id: 'timeslot_002',
      year: '1st',
      branch: 'CSE',
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '11:00',
    },
  });

  const timeslot3 = await prisma.timeslot.upsert({
    where: { 
      year_branch_dayOfWeek_startTime: {
        year: '1st',
        branch: 'CSE',
        dayOfWeek: 1,
        startTime: '11:00'
      }
    },
    update: {},
    create: {
      id: 'timeslot_003',
      year: '1st',
      branch: 'CSE',
      dayOfWeek: 1,
      startTime: '11:00',
      endTime: '12:00',
    },
  });

  // Create sample timeslots for ECE 1st year
  const timeslot4 = await prisma.timeslot.upsert({
    where: { 
      year_branch_dayOfWeek_startTime: {
        year: '1st',
        branch: 'ECE',
        dayOfWeek: 1,
        startTime: '09:00'
      }
    },
    update: {},
    create: {
      id: 'timeslot_006',
      year: '1st',
      branch: 'ECE',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const timeslot5 = await prisma.timeslot.upsert({
    where: { 
      year_branch_dayOfWeek_startTime: {
        year: '1st',
        branch: 'ECE',
        dayOfWeek: 1,
        startTime: '10:00'
      }
    },
    update: {},
    create: {
      id: 'timeslot_007',
      year: '1st',
      branch: 'ECE',
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '11:00',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user created:', admin.email);
  console.log('Teachers created:', teacher1.email, teacher2.email);
  console.log('Students created:', student1.email, student2.email, student3.email);
  console.log('Timeslots created:', timeslot1.id, timeslot2.id, timeslot3.id, timeslot4.id, timeslot5.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

