# QuikAttend

QR-based attendance web app for Admins, Teachers, and Students.

## Features
- Teacher: Generate time-limited QR, live attendance count, records & search
- Student: Scan QR (mobile camera), attendance history & stats
- Admin: Manage users, timeslots, records (filter/export), classes

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix)
- Prisma + SQLite (local), JWT auth
- QR: qrcode (generate), html5-qrcode (scan)

## Quick Start
- Dev:
```bash
npm install
npm run dev
# http://localhost:3000
```
- Demo (recommended):
```bash
npm install
npm run build
npm run start -- -H 0.0.0.0 -p 3000
# Optional HTTPS for mobile camera
cloudflared tunnel --url http://localhost:3000
```

Full setup and demo credentials in `SETUP_INSTRUCTIONS.md`.

## License
MIT © 2025 Your Name
