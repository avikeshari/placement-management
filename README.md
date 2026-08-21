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

The demo seed creates multiple students and companies so every major placement workflow has realistic data to inspect. The original demo credentials remain unchanged.

### Students

| Role | Email | Password | Demo profile |
|---|---|---|---|
| Student 1 | `student.demo@aviportal.com` | `Student@123` | CSE, 8.7 CGPA, React/Node/MongoDB |
| Student 2 | `student2.demo@aviportal.com` | `Student2@123` | IT, 8.1 CGPA, Java/Spring/SQL |
| Student 3 | `student3.demo@aviportal.com` | `Student3@123` | ECE, 7.8 CGPA, Python/SQL/Power BI |
| Student 4 | `student4.demo@aviportal.com` | `Student4@123` | CSE, 7.2 CGPA, frontend/UI skills, 1 backlog |

### Companies

| Role | Email | Password | Demo profile |
|---|---|---|---|
| Company 1 | `company.demo@aviportal.com` | `Company@123` | Information Technology, Bengaluru |
| Company 2 | `company2.demo@aviportal.com` | `Company2@123` | Data & Analytics, Pune |
| Company 3 | `company3.demo@aviportal.com` | `Company3@123` | Financial Technology, Hyderabad |

### Admin

| Role | Email | Password |
|---|---|---|
| Admin | `admin.demo@aviportal.com` | `Admin@123` |

### Seeded demo data

Running `npm run seed:demo` creates or updates the demo dataset without creating duplicate demo users. The current seed provides:

- **4 student profiles** with academic records, CGPA, branch, skills, preferences, projects, certifications and demo resumes.
- **3 company profiles** with contact details, websites, industries, descriptions and locations.
- **8 open jobs** across the three demo companies, including full-time jobs and internships.
- **Multiple application states** for testing: applied, shortlisted, interview, selected, rejected and withdrawn.
- **Unapplied jobs** so the Student Jobs and Apply flow can be tested from a clean state.
- **1 scheduled online interview** with a manual meeting link for the original demo student.
- **1 demo conversation/message thread** connected to that interview application.
- **1 career event** and **1 placement drive** with the demo companies attached.

The main `student.demo@aviportal.com` account is intentionally kept in a useful mixed state:

| Job | Application state | Interview |
|---|---|---|
| Frontend Developer | Applied | No |
| Full Stack Developer | Shortlisted | No |
| Backend Developer | Interview | Scheduled |
| QA Engineer | Not applied | No |
| Data Analyst | Not applied | No |

The other demo students provide additional company-side applicant records, including selected, rejected, withdrawn, applied and shortlisted applications. This makes the Applicant, Applications, Profile, Interviews and dashboard sections visibly populated immediately after seeding.

### Refreshing demo data

From `backend/`:

```bash
npm run seed:demo
```

To remove the existing demo jobs/applications/interviews for the three demo companies and rebuild the complete demo dataset:

```bash
npm run seed:demo -- --reset
```

The reset operation is scoped to the known demo company accounts and does not intentionally delete unrelated production users or jobs.

Do not use these demo passwords for a real production deployment.

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
Build Command: npm ci
Start Command: npm start
```

Add the backend variables from `backend/.env.example` in Render. The application expects `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, the three Cloudinary variables, and the SMTP variables shown in the example. No Daily API is used; interviews use the manual meeting-link approach. Never commit the real `backend/.env`.

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

`frontend/netlify.toml` proxies `/api/*` to the Render backend (`https://placement-management-br31.onrender.com`) while keeping the user-facing site on the Netlify URL. Keep the Netlify `VITE_API_URL` value as `/api`; do not replace it with the Render URL.

### Local Vite development proxy

For local development, `frontend/vite.config.js` proxies `/api/*` to `http://localhost:5000`. Keep `VITE_API_URL=/api` so the same frontend API paths work locally and on Netlify.

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

Online interviews use a **manual meeting-link approach**. No Daily video API or Google Meet REST API is required.

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

Online interviews use a **manual meeting-link approach**. No Daily video API or Google Meet REST API is required.

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


# Specification Coverage

The current version includes the major requirements from the College Placement Management System brief:

- Student applications with resume and cover letter
- Application status tracking and withdrawal
- Interview scheduling for online/offline interviews
- Interview accept/decline/cancel workflows
- Automated interview confirmation and 24-hour/1-hour reminder emails
- Student-company messaging after interview scheduling
- Company job and internship opportunity types
- Company applicant review, resume access, feedback and hiring decisions
- Placement Drive management and student participation
- Drive participation/performance CSV reporting
- Recruitment dashboards and graphical analytics
- Academic records with CGPA, grades-related fields, achievements and transcript metadata
- Profile-to-academic-record synchronization for student profile updates
- Company database CSV export and import/update for existing company accounts
- Offer acceptance/decline tracking
- MERN stack, TailwindCSS, Netlify and Render deployment configuration
- Manual external meeting links for virtual interviews (Google Meet/Zoom/Teams compatible)

For production email reminders, configure the SMTP variables in the backend environment.

## Industry-Benchmark Features (Non-AI)

The platform includes additional recruiting-platform capabilities beyond the core placement workflow:

- Student profile privacy controls: Private, Employers, Community
- Optional GPA sharing with employers
- Career interests, preferred locations and job types
- Saved jobs
- Saved searches and job alerts
- Non-AI profile/job match scoring based on explicit profile data and eligibility
- Employer following
- Verified employer workflow
- Employer talent search
- Private company candidate notes
- In-app notifications
- Career events and fairs with registration
- Calendar `.ics` export for events
- Career resources
- Admin audit logs
- Company database import/export
- Interview reminders and notifications
- Application and offer workflow
- Student/company messaging

AI career assistance and AI hiring decisions are intentionally not included.

## Industry-benchmark module architecture

The benchmark features are exposed through dedicated modules in addition to the consolidated benchmark API for backward compatibility:

- Saved jobs/searches
- Notifications
- Company follows
- Career events
- Candidate search and notes
- Saved candidates
- Audit logs
- Job matching and job alerts

The legacy `/api/benchmark/*` endpoints remain available while the dedicated endpoints under `/api/notifications`, `/api/saved-jobs`, `/api/saved-searches`, `/api/company-follows`, `/api/candidate-search`, `/api/career-events`, `/api/audit-logs`, and `/api/saved-candidates` are also available.

## Student Career Resources

The Student → Career Resources area is a four-section career center:

- **Resume Preparation** (`/student/resources/resume`) — resume structure, content guidance and a final resume checklist.
- **Interview Preparation** (`/student/resources/interview`) — HR, technical, STAR-method, company research and interview-day preparation guidance.
- **Placement Readiness Checklist** (`/student/resources/checklist`) — dynamically calculated from the signed-in student's profile, verified academic record, resume, skills, projects/experience, certifications, job preferences, applications and interviews.
- **Professional Communication** (`/student/resources/communication`) — recruiter communication guidance and copyable message templates.

The readiness checklist does not store a separate manual completion flag. It derives completion from live placement data returned by `/api/profile/me`, `/api/academic/me`, `/api/applications/my`, `/api/interviews/my`, and `/api/drives`. Drive registration and interview-response items are shown as not applicable when there is no current drive or scheduled interview. The article pages include links to public university/career-service sources; their content is paraphrased rather than copied verbatim.

## Render backend deployment

The backend is designed to run from the `backend` directory. For Render, use:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- `NODE_ENV=production`
- Do not hard-code Render's `PORT`; Render supplies it automatically.

After deployment, verify these endpoints:

- `GET /api/health` should return `Placement API is healthy`.
- `GET /api/auth` should return `Authentication API is available`.
- `POST /api/auth/login` is the login endpoint.
- `POST /api/auth/register` is the registration endpoint.

If `/api/health` works but `/api/auth` returns `Route ... not found`, the deployed Render service is not running the same backend commit that contains `server.js` and `routes/authRoutes.js`. Redeploy the latest commit and confirm the Render root directory is `backend`.

## Authentication deployment verification

After deploying the backend to Render, verify these endpoints directly:

- `GET /api/health` should return `success: true` and an `apiVersion`.
- `GET /api/auth` should return `Authentication API is available`.
- `GET /api/auth/login` should return HTTP 405 and state that login requires POST.
- `GET /api/auth/register` should return HTTP 405 and state that registration requires POST.
- The frontend should use `VITE_API_URL=/api` on Netlify; `frontend/netlify.toml` proxies `/api/*` to the Render backend.

If `/api/health` works but `/api/auth` returns `Route /api/auth not found`, Render is serving an older/different commit or the service Root Directory is not `backend`. Check the Render deployment commit and service Root Directory before changing frontend authentication code.
