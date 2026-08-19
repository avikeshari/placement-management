# Placement Portal By Avi

Full-stack MERN placement management application for students, companies and administrators.

## Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Cloudinary resume storage
- Daily video interviews
- Nodemailer email notifications
- Recharts-ready analytics
- Render backend deployment
- Netlify frontend deployment

## Project structure

```text
placement-management/
├── backend/
└── frontend/
```

## Local setup

### Backend

```bash
cd backend
npm install
# create .env from .env.example and add your local credentials
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# create .env from .env.example
npm run dev
```

For local development, `frontend/.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo credentials

The following credentials are recommended for demonstration/testing:

| Role | Email | Password |
|---|---|---|
| Student | `student.demo@aviportal.com` | `Student@123` |
| Company | `company.demo@aviportal.com` | `Company@123` |
| Admin | `admin.demo@aviportal.com` | `Admin@123` |

These credentials can be created automatically with the included demo seed script. From `backend/`, configure `MONGO_URI` and run:

```bash
npm run seed:demo
```

The script creates/updates all three demo accounts and creates the student profile. Do not use these passwords for a real production deployment.

## Permanent production admin

The project includes a dedicated production-admin creation script. It does **not** hard-code an admin password in the source code. Configure the following variables in the production backend environment (Render) or in `backend/.env` for local setup:

```env
ADMIN_NAME=Placement Portal Administrator
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace-with-a-strong-password
```

Then, from `backend/`, run:

```bash
npm run admin:create
```

The script:

- creates the admin account with the configured email/password;
- hashes the password before saving it;
- keeps the account permanently in MongoDB;
- does not overwrite the password if the admin already exists;
- stops with an error if the configured email already belongs to a non-admin account.

For a Render deployment, add the three `ADMIN_*` variables to the backend service and run `npm run admin:create` once against the production MongoDB database. Keep the password private and do not commit it to GitHub.

## Production deployment

### Render backend

Use the same GitHub repository with:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add the backend variables from `backend/.env.example` in Render. Never commit the real `backend/.env`.

Set:

```env
FRONTEND_URL=https://avi-placement-portal.netlify.app
```

### Netlify frontend

Use the same GitHub repository with:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Production frontend environment variable:

```env
VITE_API_URL=/api
```

`frontend/netlify.toml` proxies `/api/*` to the Render backend while keeping the user-facing site on the Netlify URL.

The public pages remain:

```text
https://avi-placement-portal.netlify.app/login
https://avi-placement-portal.netlify.app/register
```

The API is accessed through the same Netlify origin, for example:

```text
https://avi-placement-portal.netlify.app/api/auth/login
```

and Netlify forwards it to the Render backend.

## Environment variable safety

Do not commit real `.env` files, database passwords, JWT secrets, Cloudinary secrets, Daily API keys or email passwords. Only `.env.example` files belong in the repository.

## Tester notes / validation

- Registration and login show clear validation messages before submitting invalid data.
- Job posting validates title, description, company, location, salary, minimum CGPA, required skills and deadline.
- Resume uploads accept only PDF, DOC and DOCX files up to 5 MB.
- Resume delivery preserves the original extension, and the Download action uses the original filename and file type. Cloudinary raw assets require the extension in their public ID.
- Student job discovery uses the public `GET /api/jobs` endpoint; the company-only `GET /api/jobs/company/my` endpoint is not used by the student Jobs page. After deployment, redeploy the latest frontend build so the deployed bundle contains this route.

## Student Jobs API

The student Find Jobs page uses the authenticated student endpoint:

```text
GET /api/jobs/student
```

The endpoint requires the logged-in user to have the `student` role. Company job management remains under `/api/jobs/company/my`.

After deploying this change, rebuild/redeploy both the Render backend and Netlify frontend so the frontend and backend versions stay synchronized.

## Admin Module

The Admin area provides centralized placement-management controls:

- Dashboard with students, companies, jobs, applications, interviews and placement KPIs
- Student management with search, activation/deactivation and deletion
- Company management with search, activation/deactivation and deletion
- Job moderation and deletion
- Application monitoring with status filters
- Interview monitoring
- Placement analytics for applications, branches and companies
- Academic CSV import
- CSV reports for students, companies, jobs, applications and placements
- Admin profile view

The permanent production administrator is automatically checked/created when the backend starts after MongoDB connects.

Production admin credentials configured in code:

```text
Email: admin@aviportal.com
Password: Admin@12345
```

For a real production system, replace these hard-coded credentials with secure Render environment variables before making the repository public.
