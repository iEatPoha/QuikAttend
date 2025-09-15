# QuikAttend - Attendance Management System

## Overview
QuikAttend is a full-stack web application for managing student attendance using QR codes. Built with Next.js, Prisma, and SQLite for complete local operation.

## Architecture
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes (serverless-style handlers) with Prisma ORM
- **Database**: SQLite (completely local, no external dependencies)
- **Authentication**: Custom JWT-based auth with role-based access control

## User Roles & Features

### Admin
- **User Management**: Add/edit/delete teachers and students
- **Timeslot Management**: Create class schedules with timetable grid view
- **System Overview**: Monitor overall attendance statistics

### Teacher  
- **QR Generation**: Generate time-limited QR codes (60-second expiry) for current class
- **Live Tracking**: Real-time attendance count during active sessions
- **Records**: View detailed attendance records with student search

### Student
- **QR Scanning**: Scan QR codes using camera or manual input
- **Attendance History**: View personal attendance statistics and history
- **Status Tracking**: See present/absent status for all classes

## Database Schema

### Key Models
- **User**: Stores admin/teacher/student data with role-based fields
- **Timeslot**: Weekly recurring class schedules (year/branch/day/time)
- **Class**: Individual class instances with QR codes and status
- **Attendance**: Student attendance records (present/absent/cancelled)

### Academic Year System
- **Year**: Academic year as "1st", "2nd", "3rd", "4th" 
- **Branch**: Academic branch like "CSE", "ECE", "MECH", etc.

## QR Code System
- **Generation**: Automatic mapping to current timeslot based on day/time
- **Expiry**: 60-second automatic expiration for security
- **Validation**: Prevents duplicate scans and validates student enrollment
- **Auto-marking**: Marks absent students when class ends

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with role-based redirect
- `POST /api/auth/logout` - User logout

### Admin APIs
- `GET/POST /api/admin/users` - User management
- `PUT/DELETE /api/admin/users/[id]` - User operations
- `GET/POST /api/admin/timeslots` - Timeslot management
- `PUT/DELETE /api/admin/timeslots/[id]` - Timeslot operations

### Teacher APIs
- `POST /api/teacher/generate-qr` - Generate QR for current class
- `GET /api/teacher/attendance-count/[classId]` - Live attendance count
- `GET /api/teacher/records` - Attendance records
- `GET /api/teacher/student-attendance` - Student search

### Student APIs
- `POST /api/student/scan-qr` - Validate QR code
- `POST /api/student/mark-attendance` - Mark attendance
- `GET /api/student/attendance-history` - Personal history

## Security Features
- Password hashing with bcrypt
- JWT tokens for session management
- Role-based route protection
- QR code expiration and validation
- Duplicate attendance prevention

## Mobile Optimization
- Responsive design for all screen sizes
- Camera integration for QR scanning
- Touch-friendly interfaces
- Optimized for low-end devices

## Tech Stack (for PPT)
- Framework: Next.js 15 (App Router)
- Language: TypeScript (React 19)
- Styling: Tailwind CSS, shadcn/ui (Radix primitives)
- Icons: lucide-react
- State/UI: React hooks, Radix UI components
- Auth: Custom JWT + role-based guards
- DB/ORM: SQLite (local) + Prisma
- QR: qrcode (generation), html5-qrcode (scanning)
- Charts/Extras: Recharts (optional), date-fns

## Development Notes
- SQLite for zero-config local development
- Prisma for migrations and type-safe queries
- Component library consistency via shadcn/ui
- Mobile camera with HTTPS requirement noted
- Optimized prod build recommended for demos
