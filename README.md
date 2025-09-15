QuikAttend

QR-based attendance web app for Admins, Teachers, and Students. Fast, accurate, and scalable attendance tracking using QR codes.

Problem Statement

Manual attendance takes 5–10 minutes per class, wasting valuable teaching time.

With 4 years × 5 branches × ~75 students per batch, attendance tracking becomes a massive workload.

Errors, proxy attendance, and disputes are common in manual systems.

Solution

QuikAttend streamlines attendance using QR codes:

Teacher: Generate short-lived (60s) QR codes tied to timeslots. View attendance records and search by student.

Student: Scan QR once per timeslot to mark presence. View attendance history (present/absent/cancelled).

Admin: Manage users (teachers/students) and create/edit timetables.

✅ Benefits: Fast, accurate, transparent, and scalable for multiple branches & years.

Features

Time-limited QR scanning (prevents proxies)

Auto-mapping to nearest timeslot

Attendance history dashboards for all roles

Simple, minimal, and mobile-optimized interface

Tech Stack

Framework: Next.js 15 (App Router), TypeScript

Styling: Tailwind CSS, shadcn/ui (Radix)

Database/ORM: Prisma + SQLite (local)

Auth: JWT-based with role guards

QR: qrcode (generation), html5-qrcode (scanning)

Quick Start
Dev Mode

npm install
npm run dev
http://localhost:3000

Production Build

npm install
npm run build
npm run start -- -H 0.0.0.0 -p 3000

For HTTPS (needed for camera)

cloudflared tunnel --url http://localhost:3000

Future Scope

Geolocation-based QR validation (student must be inside campus)

Wi-Fi based scan validation (must be connected to college network)

Analytics dashboards for attendance trends

Integration with ERP/LMS systems

License

MIT © 2025 iEatPoha