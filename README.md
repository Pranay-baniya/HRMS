# Inseed HRMS

A Human Resource Management System built for Inseed Tech Pvt. Ltd., a React Native and AI integration agency based in Kathmandu.

## Stack

- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Backend: Express.js (REST API)
- Database: MongoDB (Mongoose)
- Auth & Storage: Supabase

## Modules included

1. Employee Management (profiles, roles, departments, employment type)
2. Project Management (modeled after real Inseed clients: Afterlight, Artizan, NewTree, INSKAAI)
3. Allocations (assign employees to projects)
4. Attendance (check-in/check-out)
5. Leave Management (request + approval workflow)
6. Task Tracking (per project, simple kanban statuses)
7. Payroll (generate payslips, mark as paid)

## How auth works

Sign-up (`/signup`) posts to `POST /api/auth/signup` on the backend, which creates the
Supabase auth user via the service-role API and, in the same request, creates the matching
`Employee` record in MongoDB with that user's `supabaseUserId`. The very first person to sign
up is assigned `role: "admin"`; everyone after that gets `role: "employee"`.

Sign-in happens directly from the frontend against Supabase. When a user logs in, Supabase
issues a JWT. Every API request sends that JWT in the `Authorization: Bearer <token>` header.
The Express backend verifies the JWT against `SUPABASE_JWT_SECRET`, then looks up the
matching `Employee` record in MongoDB by `supabaseUserId`.

## Setup

### 1. Supabase

1. Create a project at supabase.com
2. Go to Authentication > Users, and manually create your first user (e.g. yourself as admin), or enable sign-ups
3. Copy the user's UID once created, you will need it for the matching Employee record
4. Go to Project Settings > API to get your `SUPABASE_URL`, `anon` key, and `SUPABASE_JWT_SECRET` (under JWT Settings)

### 2. MongoDB

Create a free cluster at mongodb.com/cloud/atlas, or run MongoDB locally. Get your connection string.

### 3. Backend

```
cd backend
cp .env.example .env
# fill in MONGO_URI, SUPABASE_URL, SUPABASE_JWT_SECRET, CLIENT_URL
npm install
npm run dev
```

Backend runs on http://localhost:5000

### 4. Create your first employee record

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `backend/.env` (step 3), then sign up through
the app itself at `/signup` (see step 5). The first account created this way is automatically
assigned `role: "admin"`; everyone who signs up after that gets `role: "employee"`. Admins can
promote/edit other employees afterwards through the UI.

If you'd rather bootstrap manually instead of using `/signup`, you can still create a Supabase
user by hand (Authentication > Users) and insert a matching `Employee` document directly in
MongoDB using that user's UID and `role: "admin"`.

### 5. Frontend

```
cd frontend
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Frontend runs on http://localhost:3000

Go to http://localhost:3000/signup to create your first (admin) account, then sign in.

## Project structure

```
inseed-hrms/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Project.js
│   │   ├── Allocation.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Task.js
│   │   └── Payroll.js
│   ├── controllers/
│   ├── routes/
│   └── server.js
│
└── frontend/
    ├── app/
    │   ├── page.js (login)
    │   ├── dashboard/
    │   ├── employees/
    │   ├── projects/
    │   ├── attendance/
    │   ├── leaves/
    │   └── payroll/
    ├── components/
    └── lib/
```

## Roles

- `admin`: full access, including payroll and deactivating/deleting employees and projects
- `HR`: manage employees, projects, allocations, and review leave requests — no payroll access, no delete access
- `employee`: self-service (check in/out, request leave, view own payslips)

## Notes for your college submission

- The Project model is intentionally shaped around real agency work (client name, category:
  healthtech/fintech/sportstech/events/internal_product) so you can populate it with
  actual-feeling data like Afterlight, Artizan, and NewTree for your demo.
- Payroll is intentionally simple (base salary minus deductions plus bonuses). If your
  course requires tax logic, that is the function to extend: `generatePayroll` in
  `backend/controllers/payrollController.js`.
- Consider adding a short system design document alongside this code (ER diagram, module
  breakdown, sequence diagram for the auth flow) since most college HRMS rubrics score
  design documentation separately from the working code.
