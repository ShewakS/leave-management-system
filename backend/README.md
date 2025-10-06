# SLMS Backend

Quickstart:

1. cd backend
2. npm install
3. create a .env file with MONGO_URI and JWT_SECRET (optionally SMTP settings)
4. npm run dev

Environment variables:
- MONGO_URI - MongoDB connection string
- JWT_SECRET - secret for JWT tokens
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - optional email settings

Seeding demo users (dev only):
- To create demo Student and Faculty users run:

	node scripts/seed.js

This creates:
- student@example.com / password (Student)
- teacher@example.com / password (Faculty)

Auth endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (returns user profile from token)
