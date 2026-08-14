import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold">
        Student Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Manage your placement profile, applications and interviews.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <Link
          to="/student/profile"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Complete Profile
          </h2>
          <p className="text-slate-500 mt-2">
            Update academic information and resume.
          </p>
        </Link>

        <Link
          to="/student/jobs"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Browse Jobs
          </h2>
          <p className="text-slate-500 mt-2">
            Explore current placement opportunities.
          </p>
        </Link>

        <Link
          to="/student/applications"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Applications
          </h2>
          <p className="text-slate-500 mt-2">
            Track your application status.
          </p>
        </Link>
      </div>
    </section>
  );
};

export default Dashboard;
