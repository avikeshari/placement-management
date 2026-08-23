# Placement Portal By Avi

Full-stack MERN placement management application for students, companies and administrators.

## Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Cloudinary resume storage
- Online interviews using company-provided meeting links
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

The script creates/updates all three demo accounts and ensures demo student/company profiles, jobs, applications, and a sample interview exist. The backend also ensures this demo data exists automatically at startup. Do not use these passwords for a real production deployment.

## Permanent production admin

The backend automatically checks for the permanent production administrator every time it starts, after MongoDB connects. If the account does not exist, it is created automatically. If it already exists, it is left unchanged.

Current project credentials:

```text
Email: admin@aviportal.com
Password: Admin@12345
```

You do not need to run `npm run admin:create` for normal deployment. The command remains available as a manual utility if needed. Do not use these credentials for a real public production system.

## Production deployment

### Render backend

Use the same GitHub repository with:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add the backend variables from `backend/.env.example` in Render. In particular, configure `MONGO_URI`, `JWT_SECRET`, Cloudinary credentials, `FRONTEND_URL`, and the email variables if email notifications are enabled. Never commit the real `backend/.env`.

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

### Online Interviews

Online interviews use a **manual meeting-link approach**. No Daily API or Google Meet REST API is required.

When a company schedules an online interview, it enters:

- Interview date
- Interview time
- Meeting link

The application generates a pre-drafted interview message and stores it in the student's **Interviews** section. The same message can also be sent by email through the configured SMTP account.

The meeting link can be from Google Meet, Zoom, Microsoft Teams, or another valid HTTPS meeting provider.

For offline interviews, the company enters the interview location instead of a meeting link.

## Email configuration

The backend mailer expects these names:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=Placement Portal
```

For Gmail, use an App Password rather than your normal account password.

## Environment variable safety

Do not commit real `.env` files, database passwords, JWT secrets, Cloudinary secrets, email passwords. Only `.env.example` files belong in the repository.

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

## Audit Hardening

The current version includes additional safeguards identified during the architectural audit:

- Server-side role validation prevents registration as `admin`.
- JWT authentication checks the current `isActive` state on every protected request, so deactivated users cannot continue using an existing token.
- Company/student resource access is ownership-checked to reduce IDOR risks.
- Job search uses escaped search expressions and bounded pagination.
- Job deadlines are validated on both the frontend and backend and stored as absolute timestamps.
- Job deletion is a soft archive so application and interview history is preserved.
- Application records use a compound unique index on `(student, job)` to prevent duplicate submissions.
- Applications are validated against the immutable `AcademicRecord` collection at submission time.
- Academic eligibility can include CGPA, backlogs, branch, graduation year, and required skills.
- A student with an existing selected offer cannot apply for another job.
- Academic CSV import validates the complete batch before committing it and uses a MongoDB transaction so partial batches are not committed.
- Academic records use unique indexes for student identity and supplied enrollment numbers.
- Resume uploads are limited to 5 MB and require matching file signatures for PDF, DOC, or DOCX files.
- Resume delivery is performed through authenticated backend endpoints rather than exposing a direct storage URL in the UI.
- Interview scheduling checks for overlapping scheduled slots for both the candidate and company.
- Interview meeting links are revealed through an authenticated interview-access endpoint.
- The Apply action uses a loading/disabled state to prevent repeated submissions.
- Student job cards display explicit server-calculated eligibility information.
- List pages provide retryable error states and the frontend includes a global error boundary.
- Interview dates are sent as ISO timestamps and displayed in the browser's local timezone.

## Online Interview Approach

Online interviews use a **manual meeting-link approach**. No Daily API or Google Meet REST API is required.

When a company schedules an online interview, it enters:

- Interview date
- Interview time
- Meeting URL

The system generates a pre-drafted interview message containing the candidate name, job title, company, date, time, mode, and meeting link. The message is stored with the interview and displayed in the student's **Interviews** section. It is also sent through the configured SMTP email service when email delivery is available.

The student and company must be authenticated members of the interview to reveal the meeting link through the portal.

For offline interviews, the company enters the interview location instead of a meeting link.

## Academic Record Import Rules

CSV imports must contain a valid student email. Optional academic fields are validated when supplied. The entire batch is rejected if a row is invalid or references a non-existent student account; valid records are not partially committed from a failed batch.

Recommended columns:

```csv
studentEmail,enrollmentNumber,college,course,branch,graduationYear,cgpa,backlogs,skills
student@example.com,2027CSE001,ABC Institute of Technology,B.Tech,CSE,2027,8.5,0,React,JavaScript,Node.js
```

For skills, use a comma-separated value inside the CSV field and quote the field when it contains commas, for example:

```csv
"React,JavaScript,Node.js"
```

## Security Reminder

Do not commit real `.env` files, MongoDB credentials, Cloudinary secrets, SMTP passwords, JWT secrets, or administrator credentials to source control.

> **Database note:** atomic application submission and academic CSV import use MongoDB transactions. MongoDB Atlas supports transactions by default. If you use a local MongoDB instance, run it as a replica set to use these transaction-backed workflows.

## Interview Responses and Application Withdrawal

### Company
- Companies can open an online meeting link from the Interviews section.
- Companies can cancel a scheduled interview using **Cancel Interview**.
- Cancelling an interview notifies the student and returns an `interview` application to `shortlisted`, allowing the company to reschedule later.

### Student
- Students can **Accept Interview** or **Decline Interview** from the Interviews section.
- Accepting records the student's acceptance and sends the company a response message.
- Declining cancels the interview, returns the application to `shortlisted`, and sends the company a response message.
- Students can optionally provide a custom decline message; a default message is used if they leave it blank.
- Students can **Withdraw Application** from applications that are currently `applied`, `shortlisted`, or `interview`.
- Withdrawing changes the application status to `withdrawn` and, if an interview was scheduled, cancels that interview and notifies the company.
- Selected, rejected, and already withdrawn applications cannot be withdrawn again.

---

# Student–Company Messaging

The portal includes an in-app messaging system for interview-stage communication.

Messaging is intentionally **not available immediately after an application is submitted**. A private conversation is created when the company schedules an interview for that application.

### Flow

```text
Student applies
      ↓
Company reviews application
      ↓
Company shortlists/selects candidate
      ↓
Company schedules interview
      ↓
Private Student ↔ Company conversation is created
      ↓
Both users can exchange messages
```

### Student

Students can open **Messages** from the sidebar after an interview has been scheduled. They can:

- View connected companies
- View interview-related conversations
- Send messages to the company
- Receive company messages
- See the latest message without refreshing the page
- Open a conversation directly from the interview section

### Company

Companies can open **Messages** from the sidebar after scheduling an interview. They can:

- View connected candidates
- View interview-related conversations
- Send messages to candidates
- Receive student messages
- Open a conversation directly from the interview section or applicant list

Messages are restricted to the student and company associated with the application. Students and companies cannot access another application's conversation by changing an ID in the URL.

The messaging UI refreshes the selected conversation periodically so newly received messages appear without a full-page refresh.

# Automated Testing

The project includes two layers of automated testing:

## Backend audit and API smoke tests

From `backend/`:

```bash
npm install
npm run test:audit
```

This runs white-box checks and, when `TEST_BASE_URL` is provided, black-box HTTP checks against the running backend. For a local backend:

```bash
TEST_BASE_URL=http://localhost:5000 npm run test:audit
```

## Frontend end-to-end tests

The frontend uses Playwright for browser-level E2E testing. For a **local E2E run**, Playwright automatically:

1. Resets/reseeds the demo placement data.
2. Starts the backend if it is not already running.
3. Starts the Vite frontend if it is not already running.
4. Opens Chromium and runs the complete browser suite.

Install dependencies and Chromium once:

```bash
cd frontend
npm install
npx playwright install chromium
```

Then simply run:

```bash
npm run test:e2e
```

You do **not** need to start the backend or frontend manually for a normal local E2E run. Existing servers on ports 5000 and 5173 are reused when available. On Windows, the global setup invokes `node` directly for demo seeding instead of spawning `npm.cmd`, avoiding the `spawnSync npm.cmd EINVAL` issue.

The local E2E seed is enabled by default. To explicitly disable it:

```bash
E2E_SEED_DEMO=false npm run test:e2e
```

For a deployed frontend, set the base URL. The deployed test never resets the remote database unless you explicitly set `E2E_SEED_DEMO=true`:

```bash
E2E_BASE_URL=https://avi-placement-portal.netlify.app npm run test:e2e
```

Demo credentials can be overridden without editing the test files:

```bash
E2E_STUDENT_EMAIL=student.demo@aviportal.com
E2E_STUDENT_PASSWORD=Student@123
E2E_COMPANY_EMAIL=company.demo@aviportal.com
E2E_COMPANY_PASSWORD=Company@123
```

The browser suite checks:

- Login and registration routes
- SPA/404 routing
- Student dashboard navigation
- Student jobs and full job details
- Student applications
- Student interviews
- Student/company messaging pages
- Company job management navigation
- Company interview controls
- Manual meeting-link/cancellation UI

Test artifacts are written to `frontend/playwright-report/`; traces, screenshots, and videos are retained for failed tests.

