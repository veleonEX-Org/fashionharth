I want you to generate a complete full-stack starter template with the following requirements. Please read everything carefully and structure the output exactly as instructed.

🔷 PROJECT OVERVIEW

Create a production-ready full-stack boilerplate template consisting of:

Frontend

React + TypeScript

Vite

TailwindCSS

Parametrized design system (colors, font sizes, spacing scale → stored as constants or a theme config file)

Pages:

Public Landing Page

Login Page

Register Page

Email Verification Page

Forgot Password Page

Profile Page

Dashboard Page (role-based view)

Role-based routing:

Roles: admin, staff, user

Protect routes based on role using a higher-order component / wrapper

State management:

Use React Context or Zustand for user/auth state

Form Validation:


API handling:

Axios wrapper with interceptors for JWT auth

Backend

Node.js

Express.js

TypeScript

SQL database (MySQL or PostgreSQL) → choose either but make it configurable via .env

Secure authentication with JWT + refresh tokens

Clean architecture structure:

src/
  config/
  routes/
  controllers/
  services/
  middleware/
  database/
  utils/
  models/


Features:

Register User

Email Verification

Password Reset

Login User

Get Profile

Update Profile

Role-based authorization middleware

Admin-only route example

Database models:

User with fields:

id

first_name

last_name

email

password (hashed)

role (admin/staff/user)

createdAt, updatedAt

Password hashing with bcrypt

Use environment variables for:

DB credentials

JWT secret & refresh secret

App port

🔷 ADDITIONAL REQUIREMENTS
1. Provide folder structures for both frontend & backend

Show a tree layout.

2. Provide setup instructions

Include:

Installation

Environment variable setup

How to run frontend & backend with scripts

How to connect backend to SQL DB

3. Provide sample .env

Both frontend and backend.

4. Provide sample theme config

For Tailwind + separate theme.ts file.

5. Provide complete boilerplate code

For:

ProtectedRoute component

Auth Context / Zustand store

Axios interceptor

Express auth routes

Role middleware

User service logic

SQL table creation script

6. Make the template modular, clean, and scalable
7. Include comments inside the code for clarity
🔷 FINAL OUTPUT FORMAT

When generating the template, structure your answer in this order:

Project Overview Summary

Frontend Folder Structure

Backend Folder Structure

Environment Variable Samples

Setup & Installation Instructions

Frontend Code Files (all key files)

Backend Code Files (all key files)

SQL Schema

Theme Config & Tailwind Setup

Make sure every code sample is complete and ready to paste directly into a project.

🔷 QUALITY REQUIREMENTS

Code must be clean, typed, and follow best practices.

Put types in types file.

code must be modular, break into components. no large files.

Use modern syntax:

async/await

ES modules

proper error handling

proper validation

No placeholder logic; include real implementations.

Include all missing glue code so the project runs instantly after installation.

create the full template now in this folder.


backend/
  package.json
  tsconfig.json
  .env.example
  sql/
    schema.sql
  src/
    server.ts
    config/
      env.ts
    database/
      pool.ts
    models/
      user.ts
    types/
      auth.ts
    utils/
      jwt.ts
      password.ts
    middleware/
      authMiddleware.ts
      roleMiddleware.ts
      errorHandler.ts
    services/
      authService.ts
    controllers/
      authController.ts
      adminController.ts
    routes/
      authRoutes.ts
      userRoutes.ts
      adminRoutes.ts