-- Create some sample classes for testing
-- This script creates classes for today and marks some as completed with attendance

-- Get today's date
-- Note: This is a sample script - in production, classes would be created dynamically

-- Create a completed class from yesterday for testing attendance history
INSERT INTO Class (id, teacherId, subject, year, branch, timeslotId, date, status, createdAt, updatedAt)
VALUES (
  'class_sample_001',
  'teacher_001',
  'Mathematics',
  '1st',
  'CSE',
  'timeslot_001',
  date('now', '-1 day'),
  'COMPLETED',
  datetime('now'),
  datetime('now')
);

-- Create attendance records for the sample class
INSERT INTO Attendance (id, studentId, classId, status, createdAt, updatedAt)
VALUES 
  ('att_001', 'student_001', 'class_sample_001', 'PRESENT', datetime('now'), datetime('now')),
  ('att_002', 'student_002', 'class_sample_001', 'ABSENT', datetime('now'), datetime('now'));

-- Create another completed class
INSERT INTO Class (id, teacherId, subject, year, branch, timeslotId, date, status, createdAt, updatedAt)
VALUES (
  'class_sample_002',
  'teacher_002',
  'Physics',
  '1st',
  'CSE',
  'timeslot_002',
  date('now', '-2 days'),
  'COMPLETED',
  datetime('now'),
  datetime('now')
);

-- Create attendance records for the second sample class
INSERT INTO Attendance (id, studentId, classId, status, createdAt, updatedAt)
VALUES 
  ('att_003', 'student_001', 'class_sample_002', 'PRESENT', datetime('now'), datetime('now')),
  ('att_004', 'student_002', 'class_sample_002', 'PRESENT', datetime('now'), datetime('now'));

-- Create a cancelled class
INSERT INTO Class (id, teacherId, subject, year, branch, timeslotId, date, status, createdAt, updatedAt)
VALUES (
  'class_sample_003',
  'teacher_001',
  'Chemistry',
  '1st',
  'CSE',
  'timeslot_003',
  date('now', '-3 days'),
  'CANCELLED',
  datetime('now'),
  datetime('now')
);

-- Create cancelled attendance records
INSERT INTO Attendance (id, studentId, classId, status, createdAt, updatedAt)
VALUES 
  ('att_005', 'student_001', 'class_sample_003', 'CANCELLED', datetime('now'), datetime('now')),
  ('att_006', 'student_002', 'class_sample_003', 'CANCELLED', datetime('now'), datetime('now'));
