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

import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import StudentInterviews from "./pages/student/Interviews";

import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfile from "./pages/company/Profile";
import CompanyJobs from "./pages/company/Jobs";
import PostJob from "./pages/company/PostJob";
import Applicants from "./pages/company/Applicants";
import CompanyInterviews from "./pages/company/Interviews";

import AdminDashboard from "./pages/admin/Dashboard";
import AcademicImport from "./pages/admin/AcademicImport";

const HomeRedirect = () => {
  const { user } =
    useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
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
      <Route
        path="/"
        element={<HomeRedirect />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* STUDENT ROUTES */}
      <Route
        element={
          <ProtectedRoute
            roles={["student"]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/student"
            element={
              <StudentDashboard />
            }
          />

          <Route
            path="/student/profile"
            element={
              <StudentProfile />
            }
          />

          <Route
            path="/student/jobs"
            element={
              <StudentJobs />
            }
          />

          <Route
            path="/student/applications"
            element={
              <StudentApplications />
            }
          />

          <Route
            path="/student/interviews"
            element={
              <StudentInterviews />
            }
          />
        </Route>
      </Route>

      {/* COMPANY ROUTES */}
      <Route
        element={
          <ProtectedRoute
            roles={["company"]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/company"
            element={
              <CompanyDashboard />
            }
          />

          <Route
            path="/company/profile"
            element={
              <CompanyProfile />
            }
          />

          <Route
            path="/company/jobs"
            element={
              <CompanyJobs />
            }
          />

          <Route
            path="/company/jobs/new"
            element={<PostJob />}
          />

          <Route
            path="/company/jobs/:jobId/applications"
            element={
              <Applicants />
            }
          />

          <Route
            path="/company/interviews"
            element={
              <CompanyInterviews />
            }
          />
        </Route>
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        element={
          <ProtectedRoute
            roles={["admin"]}
          />
        }
      >
        <Route
          element={<DashboardLayout />}
        >
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/academic-import"
            element={
              <AcademicImport />
            }
          />
        </Route>
      </Route>

      {/* INTERVIEW ROOM */}
      <Route
        element={
          <ProtectedRoute
            roles={[
              "student",
              "company"
            ]}
          />
        }
      >
        <Route
          path="/interview-room"
          element={
            <InterviewRoom />
          }
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default App;