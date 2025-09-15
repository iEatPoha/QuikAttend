# QuikAttend Setup Instructions

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push

# Seed initial data (run these scripts in order)
npx prisma db execute --file ./scripts/seed-database.sql
npx prisma db execute --file ./scripts/create-sample-classes.sql
```

### 3. Start (Development)
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 4. Start (Production - recommended for demos)
```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```
For fast mobile camera access over HTTPS (no account needed):
```bash
cloudflared tunnel --url http://localhost:3000
```
Open the printed https://trycloudflare.com URL on your phone.

## Default Login Credentials

### Admin Account
- **Email**: admin@quikattend.com
- **Password**: admin123

### Teacher Account  
- **Email**: john.smith@quikattend.com
- **Password**: admin123

### Student Account
- **Email**: alice.brown@student.com  
- **Password**: admin123

### Additional Demo Accounts (if seeded)
- Teacher: priya.kapoor@quikattend.com / admin123
- Student: rahul.sharma@student.com / admin123
- Student: emma.wilson@student.com / admin123

## Database Management

### View Database (Optional)
```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

### Reset Database (If Needed)
```bash
# Delete database and recreate
rm prisma/dev.db
npx prisma db push
npx prisma db execute --file ./scripts/seed-database.sql
npx prisma db execute --file ./scripts/create-sample-classes.sql
```

## File Structure
```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── teacher/           # Teacher dashboard pages  
│   ├── student/           # Student dashboard pages
│   ├── api/               # API routes
│   └── login/             # Authentication page
├── components/            # Reusable React components
├── lib/                   # Utility functions and configs
├── prisma/               # Database schema and migrations
├── scripts/              # Database seed scripts
└── public/               # Static assets
```

## Troubleshooting

### Database Issues
- Ensure SQLite is supported on your system
- Check file permissions for `prisma/dev.db`
- Run `npx prisma db push` to sync schema

### QR Code Issues  
- Ensure camera permissions are granted
- Use manual input if camera fails
- Check that QR codes haven't expired (60 seconds)

### Authentication Issues
- Clear browser cookies/localStorage
- Verify credentials match seeded data
- Check API route responses in browser dev tools

## Production Deployment
- The app runs completely locally with SQLite
- For production, consider migrating to PostgreSQL
- Update database URL in `prisma/schema.prisma`
- Set proper environment variables for JWT secrets
