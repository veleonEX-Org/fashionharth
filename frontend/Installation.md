Setup & Installation Instructions
1. Install dependencies
From the project root:
cd frontendnpm installcd ../backendnpm install
2. Configure environment
Copy env templates:
cd backendcp .env.example .envcd ../frontendcp .env.example .env
Adjust DB credentials in backend/.env to point at your PostgreSQL instance.
3. Create database and run schema
Create a PostgreSQL database named fullstack_template (or whatever you set in DB_NAME).
Run the schema file:
psql -h localhost -U postgres -d fullstack_template -f backend/sql/schema.sql
(Adjust host/user/db as needed.)
4. Run backend
cd backendnpm run dev# API on http://localhost:5000
5. Run frontend
cd frontendnpm run dev# App on http://localhost:5173
6. Flow notes
Register a user → check backend logs for email verification link → open that link in the browser.
After verifying email, log in.
Use /dashboard and /profile (protected).
Use /admin for admin-only example (you’ll need to manually change the user’s role to admin in DB).