# Placement Management System

A full-stack **Placement Management System** designed to simplify the interaction between students, companies, and placement administrators.

The platform provides separate workflows for **Students**, **Companies**, and **Administrators**, covering job discovery, applications, recruitment, interviews, academic records, analytics, and placement management.

---

## Features

### 👨‍🎓 Student

- Student registration and login
- Student profile management
- Resume upload, view, download, replacement, and deletion
- Academic information
- Find and search jobs
- Job filtering
- CGPA and skill eligibility checking
- Apply for jobs
- Track applications
- View application status
- Interview management
- Placement status
- Notifications
- Account deletion

### 🏢 Company

- Company registration and login
- Company profile management
- Post jobs
- Edit jobs
- Close/reopen jobs
- Delete jobs
- View applicants
- View student profiles
- View/download submitted resumes
- Shortlist candidates
- Reject candidates
- Select candidates
- Schedule interviews
- Recruitment analytics
- Company account deletion

### 🛡️ Admin

- Admin dashboard
- Student management
- Company management
- Job management
- Application management
- Interview management
- Placement analytics
- Academic CSV import
- Reports
- Admin profile
- Account activation/deactivation
- Platform-wide monitoring

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- React Hot Toast
- Lucide React

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Cloudinary
- Nodemailer
- Multer
- CSV Parser
- Helmet
- Express Rate Limit

## Deployment

- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Resume Storage:** Cloudinary

---

# Project Structure

```text
placement-management/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── company/
│   │   │   └── student/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

# Requirements

Before running the project, install:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Gmail account with an App Password for email functionality
- Daily API account if interview/video functionality is enabled

---

# Local Setup

## 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd placement-management
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Use:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

DAILY_API_KEY=YOUR_DAILY_API_KEY

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL_ADDRESS
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
EMAIL_FROM=Placement Portal
```

**Never commit the real `.env` file to GitHub.**

## Start Backend

Development:

```bash
npm run dev
```

Normal startup:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Demo Credentials

Create or reset the demo accounts:

```bash
cd backend
npm run seed:demo
```

## Demo Student

```text
Email:    student.demo@aviportal.com
Password: Student@123
```

## Demo Company

```text
Email:    company.demo@aviportal.com
Password: Company@123
```

## Demo Admin

```text
Email:    admin.demo@aviportal.com
Password: Admin@123
```

The seed also ensures required Profile records exist for the demo Student and Company.

The seed script uses the `MONGO_URI` configured in the backend environment. Therefore, demo users created against a local database will not automatically exist in the deployed application. For the deployed application, use the same MongoDB Atlas database configured for Render.

---

# Production Admin

The production admin is automatically created when the backend starts.

```text
Backend starts
      ↓
Connect to MongoDB
      ↓
Check production admin
      ↓
Admin exists?
   ↙          ↘
 YES          NO
  ↓            ↓
Continue    Create admin
      ↓
Start server
```

Current permanent production admin:

```text
Email:    admin@aviportal.com
Password: Admin@12345
```

Normal production deployment does **not** require:

```bash
npm run admin:create
```

The command remains available for manual provisioning:

```bash
npm run admin:create
```

> For a real production system, administrator credentials should be stored as secure environment variables rather than hard-coded in source code. The current implementation uses hard-coded credentials because this project is configured for the stated production/demo setup.

---

# Academic Records

Administrators can import student academic information using CSV.

Navigate to:

```text
Admin → Academic Records
```

The section is labelled:

```text
Import Student Data From CSV File
```

Example:

```csv
studentEmail,enrollmentNumber,college,course,branch,graduationYear,cgpa,backlogs
student1@gmail.com,2027CSE001,ABC Institute of Technology,B.Tech,CSE,2027,8.7,0
student2@gmail.com,2027ECE001,ABC Institute of Technology,B.Tech,ECE,2027,8.2,0
```

Imported information can be associated with existing student accounts and used for:

- Student academic information
- Placement eligibility
- CGPA-based filtering
- Branch-wise analytics
- Placement analysis

---

# Resume Management

Students can:

- Upload resumes
- View resumes
- Download resumes
- Replace resumes
- Delete resumes

Resume files are stored using Cloudinary.

The application preserves:

- Original filename
- Cloudinary public ID
- Cloudinary resource type
- File format
- Delivery URL

### Cloudinary PDF Configuration

If PDF resume delivery is restricted in your Cloudinary account, enable PDF delivery in Cloudinary security settings.

Without appropriate Cloudinary PDF delivery permissions, viewing a PDF resume may result in a Cloudinary HTTP 400/403 response.

---

# Email Configuration

The application uses SMTP for email notifications.

For Gmail, use a **Gmail App Password** rather than your normal Gmail password.

Required variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL_ADDRESS
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
EMAIL_FROM=Placement Portal
```

The application uses `EMAIL_PASSWORD`.

Do **not** use:

```env
EMAIL_PASS=
```

---

# Environment Variables

## Backend

```env
NODE_ENV=
PORT=

MONGO_URI=

JWT_SECRET=
JWT_EXPIRES_IN=

FRONTEND_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

DAILY_API_KEY=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

## Frontend

Local:

```env
VITE_API_URL=http://localhost:5000/api
```

Production:

```env
VITE_API_URL=/api
```

---

# Production Deployment

Architecture:

```text
                    ┌─────────────────────┐
                    │       Netlify       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ /api/*
                               ▼
                    ┌─────────────────────┐
                    │       Render        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
             MongoDB       Cloudinary     Daily
              Atlas
```

## Backend — Render

Set Root Directory:

```text
backend
```

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

### Render Environment Variables

```env
NODE_ENV=production
PORT=10000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://avi-placement-portal.netlify.app

CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

DAILY_API_KEY=YOUR_DAILY_API_KEY

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL_ADDRESS
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
EMAIL_FROM=Placement Portal
```

## Frontend — Netlify

Since the frontend is inside `frontend/`:

### Base Directory

```text
frontend
```

### Build Command

```bash
npm run build
```

### Publish Directory

```text
dist
```

### Netlify Environment Variable

```env
VITE_API_URL=/api
```

---

# Netlify API Proxy

The frontend uses `/api` for backend requests.

Netlify forwards:

```text
https://avi-placement-portal.netlify.app/api/*
```

to:

```text
https://placement-management-br31.onrender.com/api/*
```

Example:

```text
Browser
https://avi-placement-portal.netlify.app/api/auth/login
                    │
                    ▼
Render
https://placement-management-br31.onrender.com/api/auth/login
```

This allows the frontend and backend to work together while users continue using one frontend URL.

---

# Production URLs

Frontend:

```text
https://avi-placement-portal.netlify.app
```

Login:

```text
https://avi-placement-portal.netlify.app/login
```

Registration:

```text
https://avi-placement-portal.netlify.app/register
```

Backend:

```text
https://placement-management-br31.onrender.com
```

Health Check:

```text
https://placement-management-br31.onrender.com/api/health
```

---

# MongoDB Atlas

MongoDB stores:

- Users
- Profiles
- Jobs
- Applications
- Interviews
- Academic records

Use the Atlas connection string as:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
```

Make sure Render is allowed to connect to the Atlas cluster.

---

# Security

Never commit sensitive credentials to GitHub.

Do not commit:

- `.env`
- MongoDB passwords
- JWT secrets
- Cloudinary API secrets
- Daily API keys
- Email passwords
- Production administrator passwords

Recommended `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
```

If a secret is accidentally exposed, rotate the credential immediately.

---

# Troubleshooting

## `Profile not found`

The application contains self-healing profile creation for student and company accounts. If an old account does not have a Profile document, the backend can create one when the user logs in or requests their profile.

## `Invalid email or password`

Check:

1. Email is correct.
2. Email is lowercase/trimmed.
3. The account exists in the same MongoDB database used by the backend.
4. Demo credentials were seeded against the correct database.

Run:

```bash
cd backend
npm run seed:demo
```

## `No valid records found` during CSV import

Check that the CSV contains valid column names such as:

```text
studentEmail
enrollmentNumber
college
course
branch
graduationYear
cgpa
backlogs
```

The student email should correspond to an existing student account when academic information is intended to be associated with that student.

## Resume HTTP 400/403 from Cloudinary

Check:

1. Cloudinary credentials.
2. The resume exists in Cloudinary.
3. Stored Cloudinary resource metadata is correct.
4. PDF delivery is permitted if the resume is a PDF.

## CORS Error

Check Render:

```env
FRONTEND_URL=https://avi-placement-portal.netlify.app
```

Do not add an unnecessary trailing slash.

For local development:

```env
FRONTEND_URL=http://localhost:5173
```

## Blank React Page

Check the browser console, then:

```bash
cd frontend
npm install
npm run dev
```

---

# Useful Commands

## Backend

```bash
cd backend
npm install
npm run dev
```

Production-style start:

```bash
npm start
```

Seed demo users:

```bash
npm run seed:demo
```

Manually create/check production admin:

```bash
npm run admin:create
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
npm run build
```

---

# Application Roles

## Student

```text
Profile
   ↓
Find Jobs
   ↓
Apply
   ↓
Track Application
   ↓
Interview
   ↓
Placement
```

## Company

```text
Company Profile
   ↓
Post Job
   ↓
Receive Applications
   ↓
Shortlist
   ↓
Interview
   ↓
Select / Reject
```

## Admin

```text
Platform Monitoring
   ↓
Students
Companies
Jobs
Applications
Interviews
Academic Records
Analytics
Reports
```

---

# Developer

**Developed by Avi Keshari**

> Placement Portal — Simplify your job hunt.
