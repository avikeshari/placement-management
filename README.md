# Placement Portal

A full-stack MERN placement management platform for coordinating campus placements between **students, companies, and administrators**.

The application provides role-based workflows for job postings, student applications, interviews, profiles, academic records, and administrative management. It also integrates external services for resume storage, video interviews, and email notifications.

## Features

### Student
- Register and sign in securely.
- Maintain a student profile.
- Browse available placement jobs.
- Apply for jobs and track application status.
- Upload resumes.
- View scheduled interviews and join interview rooms.
- View academic information.

### Company
- Manage company profile.
- Create and manage job postings.
- Review applicants.
- Track applications.
- Manage interviews.

### Administrator
- Access an administrative dashboard.
- Manage placement-related data.
- Import academic records from CSV files.
- Monitor platform activity and placement workflows.

## Technology Stack

### Frontend
- **React 19** — component-based user interface.
- **Vite** — frontend development server and production build tooling.
- **React Router** — client-side routing and protected routes.
- **Tailwind CSS** — responsive UI styling.
- **Axios** — HTTP client for API communication.
- **Recharts** — charting and analytics.
- **Lucide React** — interface icons.
- **React Hot Toast** — user notifications.

### Backend
- **Node.js** — JavaScript runtime.
- **Express 5** — REST API framework.
- **MongoDB** — primary database.
- **Mongoose** — MongoDB object modeling.
- **JWT** — authentication and authorization.
- **bcryptjs** — password hashing.
- **Express Validator** — request validation.
- **Helmet** — HTTP security headers.
- **CORS** — cross-origin request configuration.
- **Express Rate Limit** — rate limiting for authentication endpoints.
- **Multer / csv-parser** — file and CSV uploads.
- **Nodemailer** — email notifications.

### External Services
- **Cloudinary** — resume/file storage.
- **Daily** — video interview functionality.

## Project Structure

```text
placement-management/
├── backend/
│   ├── config/          # Database, Cloudinary and mail configuration
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Authentication, validation, uploads and errors
│   ├── models/          # Mongoose data models
│   ├── routes/          # REST API routes
│   ├── services/        # External/service integrations
│   ├── utils/           # Shared backend utilities
│   ├── validators/      # Request validation rules
│   ├── .env.example     # Backend environment variable template
│   ├── package.json
│   └── server.js        # Backend entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # API client configuration
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Application/auth state
│   │   ├── layouts/     # Shared page layouts
│   │   ├── pages/       # Student, company and admin pages
│   │   └── utils/       # Frontend helpers and validators
│   ├── .env.example     # Frontend environment variable template
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## How the Application Is Used

The platform supports the complete placement workflow:

1. **Students** create accounts, complete profiles, browse jobs, apply, and participate in scheduled interviews.
2. **Companies** manage their profiles, publish jobs, review applicants, and conduct interviews.
3. **Administrators** manage placement operations and academic data, including CSV-based academic record imports.
4. **The backend API** handles authentication, authorization, database operations, file uploads, email notifications, and integrations with external services.

The API is organized into the following main areas:

| API prefix | Purpose |
|---|---|
| `/api/auth` | Registration, login and authentication |
| `/api/profile` | User profile management |
| `/api/jobs` | Job posting and job discovery |
| `/api/applications` | Job applications and application status |
| `/api/interviews` | Interview scheduling and interview operations |
| `/api/academic` | Academic record management/imports |
| `/api/admin` | Administrative operations |
| `/api/health` | Backend health check |

## Prerequisites

Install the following before starting local development:

- **Node.js** (an LTS release is recommended)
- **npm**
- **MongoDB** (local MongoDB server or a MongoDB Atlas database)
- A **Cloudinary** account if resume uploads are required
- A **Daily** account/API key if video interviews are required
- An SMTP/email account if email notifications are required

## Local Setup

The frontend and backend run as separate applications during development.

### 1. Clone or extract the project

Open a terminal in the project root:

```bash
cd placement-management
```

### 2. Configure the backend

Go to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

On Windows, you can create/copy the file manually if `cp` is unavailable.

Configure the backend `.env` file:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

DAILY_API_KEY=your_daily_api_key

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Placement Portal
```

Start the backend in development mode:

```bash
npm run dev
```

The API will normally be available at:

```text
http://localhost:5000
```

You can verify it with:

```text
http://localhost:5000/api/health
```

A successful response indicates that the API is running.

### 3. Configure the frontend

Open another terminal and go to the frontend directory:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Set the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

## Running Frontend and Backend Together

Use two terminal windows:

**Terminal 1 — Backend**

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend communicates with the backend through:

```text
http://localhost:5000/api
```

## Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Application environment |
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `DAILY_API_KEY` | Daily video API key |
| `EMAIL_HOST` | SMTP server host |
| `EMAIL_PORT` | SMTP server port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASSWORD` | SMTP password |
| `EMAIL_FROM` | Sender name/address configuration |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Deployment

The project is configured for a **Render backend** and **Netlify frontend** deployment.

### Backend on Render

Configure the backend service with:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add the backend environment variables in Render. Set the production frontend URL in:

```env
FRONTEND_URL=https://avi-placement-portal.netlify.app
```

Do not commit the real backend `.env` file.

### Frontend on Netlify

Configure the frontend with:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

For production, use:

```env
VITE_API_URL=/api
```

The included `frontend/netlify.toml` proxies `/api/*` requests to the deployed Render backend and also provides SPA routing fallback to `index.html`.

## Security Notes

- Never commit real `.env` files or credentials.
- Keep `JWT_SECRET` private and use a strong random value.
- Do not expose Cloudinary API secrets, Daily API keys, SMTP passwords, or database credentials in source control.
- Only `.env.example` files should contain environment variable names/templates.
- The backend uses JWT authentication, password hashing, role-based authorization, validation, Helmet security headers, CORS restrictions, and authentication rate limiting.

## Available Commands

### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run preview  # Preview production build locally
```

### Backend

```bash
npm run dev      # Start backend with nodemon
npm start        # Start backend with Node.js
```

## Troubleshooting

### Frontend cannot connect to the backend

Check that:

1. The backend is running on port `5000`.
2. `frontend/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Restart the Vite development server after changing environment variables.

### MongoDB connection fails

Check that:

- `MONGO_URI` is present and correct.
- Your MongoDB server is running, or your Atlas cluster is reachable.
- If using MongoDB Atlas, the development machine/IP is permitted by the cluster's network access rules.

### CORS errors

Check that the frontend origin matches the backend's `FRONTEND_URL`. For the default local setup:

```env
FRONTEND_URL=http://localhost:5173
```

### Resume uploads fail

Verify all Cloudinary environment variables are configured correctly:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Email notifications fail

Verify the SMTP settings and credentials:

```env
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=Placement Portal
```

## License

This project is provided for educational/project use. Add the appropriate license information here if the project is intended for public distribution.
