import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InterviewRoom = lazy(() => import("./pages/InterviewRoom"));
const Messages = lazy(() => import("./pages/Messages"));

const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentAcademicRecord = lazy(() => import("./pages/student/AcademicRecord"));
const StudentFollowing = lazy(() => import("./pages/student/Following"));
const StudentJobs = lazy(() => import("./pages/student/Jobs"));
const StudentApplications = lazy(() => import("./pages/student/Applications"));
const StudentInterviews = lazy(() => import("./pages/student/Interviews"));
const StudentDrives = lazy(() => import("./pages/student/Drives"));
const SavedJobs = lazy(() => import("./pages/student/SavedJobs"));
const SavedSearches = lazy(() => import("./pages/student/SavedSearches"));
const StudentEvents = lazy(() => import("./pages/student/Events"));
const StudentNotifications = lazy(() => import("./pages/student/Notifications"));
const StudentResources = lazy(() => import("./pages/student/CareerResources"));
const StudentSettings = lazy(() => import("./pages/student/PrivacySettings"));
const ResumePreparation = lazy(() => import("./pages/student/resources/ResumePreparation"));
const InterviewPreparation = lazy(() => import("./pages/student/resources/InterviewPreparation"));
const PlacementChecklist = lazy(() => import("./pages/student/resources/PlacementChecklist"));
const ProfessionalCommunication = lazy(() => import("./pages/student/resources/ProfessionalCommunication"));

const CompanyDashboard = lazy(() => import("./pages/company/Dashboard"));
const CompanyProfile = lazy(() => import("./pages/company/CompanyProfile"));
const CompanyJobs = lazy(() => import("./pages/company/Jobs"));
const PostJob = lazy(() => import("./pages/company/PostJob"));
const EditJob = lazy(() => import("./pages/company/EditJob"));
const Applicants = lazy(() => import("./pages/company/Applicants"));
const CompanyInterviews = lazy(() => import("./pages/company/Interviews"));
const TalentSearch = lazy(() => import("./pages/company/TalentSearch"));
const CompanySavedCandidates = lazy(() => import("./pages/company/SavedCandidates"));
const CompanyNotifications = lazy(() => import("./pages/company/Notifications"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AcademicImport = lazy(() => import("./pages/admin/AcademicImport"));
const AdminStudents = lazy(() => import("./pages/admin/Students"));
const AdminCompanies = lazy(() => import("./pages/admin/Companies"));
const AdminJobs = lazy(() => import("./pages/admin/Jobs"));
const AdminApplications = lazy(() => import("./pages/admin/Applications"));
const AdminInterviews = lazy(() => import("./pages/admin/Interviews"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const AdminDrives = lazy(() => import("./pages/admin/Drives"));
const AdminVerification = lazy(() => import("./pages/admin/Verification"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={
        user.role === "student"
          ? "/student"
          : user.role === "company"
            ? "/company"
            : "/admin"
      }
      replace
    />
  );
};

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        element={
          <ProtectedRoute roles={["student"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/student"
            element={<StudentDashboard />}
          />

          <Route
            path="/student/profile"
            element={<StudentProfile />}
          />

          <Route path="/student/academic" element={<StudentAcademicRecord />} />
          <Route path="/student/following" element={<StudentFollowing />} />

          <Route
            path="/student/jobs"
            element={<StudentJobs />}
          />

          <Route
            path="/student/applications"
            element={<StudentApplications />}
          />

          <Route
            path="/student/interviews"
            element={<StudentInterviews />}
          />

          <Route
            path="/student/drives"
            element={<StudentDrives />}
          />

          <Route path="/student/saved-jobs" element={<SavedJobs />} />
          <Route path="/student/saved-searches" element={<SavedSearches />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/resources" element={<StudentResources />} />
          <Route path="/student/resources/resume" element={<ResumePreparation />} />
          <Route path="/student/resources/interview" element={<InterviewPreparation />} />
          <Route path="/student/resources/checklist" element={<PlacementChecklist />} />
          <Route path="/student/resources/communication" element={<ProfessionalCommunication />} />
          <Route path="/student/settings" element={<StudentSettings />} />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute roles={["company"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/company"
            element={<CompanyDashboard />}
          />

          <Route
            path="/company/profile"
            element={<CompanyProfile />}
          />

          <Route
            path="/company/jobs"
            element={<CompanyJobs />}
          />

          <Route
            path="/company/jobs/new"
            element={<PostJob />}
          />

          <Route
            path="/company/jobs/:jobId/applications"
            element={<Applicants />}
          />

          <Route
            path="/company/jobs/:jobId/edit"
            element={<EditJob />}
          />

          <Route
            path="/company/interviews"
            element={<CompanyInterviews />}
          />
          <Route path="/company/talent" element={<TalentSearch />} />
          <Route path="/company/saved-candidates" element={<CompanySavedCandidates />} />
          <Route path="/company/notifications" element={<CompanyNotifications />} />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute roles={["admin"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/interviews" element={<AdminInterviews />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/academic-import" element={<AcademicImport />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/drives" element={<AdminDrives />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/events" element={<AdminEvents />} />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute
            roles={["student", "company"]}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/messages" element={<Messages />} />
        </Route>

        <Route
          path="/interview-room/:interviewId"
          element={<InterviewRoom />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
      </Routes>
    </Suspense>
  );
};

export default App;
