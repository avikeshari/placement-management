import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import InterviewRoom from "./pages/InterviewRoom";
import Messages from "./pages/Messages";

import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import StudentInterviews from "./pages/student/Interviews";

import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfile from "./pages/company/Profile";
import CompanyJobs from "./pages/company/Jobs";
import PostJob from "./pages/company/PostJob";
import EditJob from "./pages/company/EditJob";
import Applicants from "./pages/company/Applicants";
import CompanyInterviews from "./pages/company/Interviews";

import AdminDashboard from "./pages/admin/Dashboard";
import AcademicImport from "./pages/admin/AcademicImport";
import AdminStudents from "./pages/admin/Students";
import AdminCompanies from "./pages/admin/Companies";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminInterviews from "./pages/admin/Interviews";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";

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
  );
};

export default App;
