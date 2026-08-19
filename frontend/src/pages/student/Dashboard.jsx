import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import getErrorMessage from "../../utils/getErrorMessage";

const Stat = ({ label, value }) => (
  <div className="bg-white border rounded-2xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState({ applications: [], interviews: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [applications, interviews, jobs] = await Promise.all([
        api.get("/applications/my"),
        api.get("/interviews/my"),
        api.get("/jobs/student")
      ]);
      setData({
        applications: applications.data.applications || [],
        interviews: interviews.data.interviews || [],
        jobs: jobs.data.jobs || []
      });
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <p className="text-red-600">{error}</p>;

  const selected = data.applications.filter((a) => a.status === "selected").length;
  const shortlisted = data.applications.filter((a) => a.status === "shortlisted" || a.status === "interview").length;
  const upcoming = data.interviews.filter((i) => new Date(i.scheduledAt) > new Date()).length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
        <p className="text-slate-500 mt-2">Your complete placement workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Applications" value={data.applications.length} />
        <Stat label="Shortlisted" value={shortlisted} />
        <Stat label="Interviews" value={upcoming} />
        <Stat label="Selected" value={selected} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Link to="/student/jobs" className="bg-white border rounded-2xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">Find Jobs</h2>
          <p className="text-slate-500 mt-2">{data.jobs.length} open opportunities are currently available.</p>
        </Link>
        <Link to="/student/applications" className="bg-white border rounded-2xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">Track Applications</h2>
          <p className="text-slate-500 mt-2">Monitor every application from applied to selected.</p>
        </Link>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
          <Link to="/student/interviews" className="text-blue-600 text-sm">View all</Link>
        </div>
        {!data.interviews.length ? (
          <p className="text-slate-500">No interviews scheduled.</p>
        ) : (
          <div className="space-y-3">
            {data.interviews.slice(0, 3).map((interview) => (
              <div key={interview._id} className="border rounded-xl p-4">
                <p className="font-medium">{interview.application?.job?.title || "Interview"}</p>
                <p className="text-sm text-slate-500 mt-1">{new Date(interview.scheduledAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
