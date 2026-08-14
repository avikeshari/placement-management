import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <section>
      <h1 className="text-2xl md:text-3xl font-bold">
        Company Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Manage placement opportunities and candidates.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <Link
          to="/company/jobs/new"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Post Job
          </h2>
          <p className="text-slate-500 mt-2">
            Create a new placement opportunity.
          </p>
        </Link>

        <Link
          to="/company/jobs"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Manage Jobs
          </h2>
          <p className="text-slate-500 mt-2">
            View and manage your job listings.
          </p>
        </Link>

        <Link
          to="/company/interviews"
          className="bg-white border rounded-2xl p-6 hover:shadow-md"
        >
          <h2 className="font-semibold text-lg">
            Interviews
          </h2>
          <p className="text-slate-500 mt-2">
            View scheduled interviews.
          </p>
        </Link>
      </div>
    </section>
  );
};

export default Dashboard;
