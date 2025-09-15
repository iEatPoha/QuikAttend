-- Create initial admin user
-- Password: admin123 (hashed)
INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) 
VALUES (
  'admin_001', 
  'System Administrator', 
  'admin@quikattend.com', 
  '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 
  'ADMIN',
  datetime('now'),
  datetime('now')
);

-- Create sample teachers
INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) 
VALUES 
  ('teacher_001', 'Dr. John Smith', 'john.smith@quikattend.com', '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 'TEACHER', datetime('now'), datetime('now')),
  ('teacher_002', 'Prof. Sarah Johnson', 'sarah.johnson@quikattend.com', '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 'TEACHER', datetime('now'), datetime('now'));

-- Create sample students
INSERT INTO User (id, name, email, password, role, year, branch, createdAt, updatedAt) 
VALUES 
  ('student_001', 'Alice Brown', 'alice.brown@student.com', '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 'STUDENT', '1st', 'CSE', datetime('now'), datetime('now')),
  ('student_002', 'Bob Wilson', 'bob.wilson@student.com', '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 'STUDENT', '1st', 'CSE', datetime('now'), datetime('now')),
  ('student_003', 'Carol Davis', 'carol.davis@student.com', '$2a$12$LQv3c1yqBwEHFl5yvHHxVOHcs5wWRvqyHlRvFecLq/Zx9GeloTtPm', 'STUDENT', '1st', 'ECE', datetime('now'), datetime('now'));

-- Create sample timeslots for CSE 1st year
INSERT INTO Timeslot (id, year, branch, dayOfWeek, startTime, endTime, createdAt, updatedAt)
VALUES 
  ('timeslot_001', '1st', 'CSE', 1, '09:00', '10:00', datetime('now'), datetime('now')),
  ('timeslot_002', '1st', 'CSE', 1, '10:00', '11:00', datetime('now'), datetime('now')),
  ('timeslot_003', '1st', 'CSE', 1, '11:00', '12:00', datetime('now'), datetime('now')),
  ('timeslot_004', '1st', 'CSE', 2, '09:00', '10:00', datetime('now'), datetime('now')),
  ('timeslot_005', '1st', 'CSE', 2, '10:00', '11:00', datetime('now'), datetime('now')),
  ('timeslot_009', '1st', 'CSE', 0, '15:00', '17:00', datetime('now'), datetime('now'));

-- Create sample timeslots for ECE 1st year
INSERT INTO Timeslot (id, year, branch, dayOfWeek, startTime, endTime, createdAt, updatedAt)
VALUES 
  ('timeslot_006', '1st', 'ECE', 1, '09:00', '10:00', datetime('now'), datetime('now')),
  ('timeslot_007', '1st', 'ECE', 1, '10:00', '11:00', datetime('now'), datetime('now')),
  ('timeslot_008', '1st', 'ECE', 2, '09:00', '10:00', datetime('now'), datetime('now'));
