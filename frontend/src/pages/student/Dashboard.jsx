import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Stat = ({ label, value }) => (
  <div className="bg-white border rounded-2xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState({
    applications: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    openJobs: 0,
    interviewsData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/student/dashboard");
      const dashboard = response.data.dashboard || {};

      setData({
        applications: Number(dashboard.applications || 0),
        shortlisted: Number(dashboard.shortlisted || 0),
        interviews: Number(dashboard.interviews || 0),
        selected: Number(dashboard.selected || 0),
        openJobs: Number(dashboard.openJobs || 0),
        interviewsData: dashboard.interviewsData || []
      });
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
        <p className="text-slate-500 mt-2">Your complete placement workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Applications" value={data.applications} />
        <Stat label="Shortlisted" value={data.shortlisted} />
        <Stat label="Interviews" value={data.interviews} />
        <Stat label="Selected" value={data.selected} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Link to="/student/jobs" className="bg-white border rounded-2xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">Find Jobs</h2>
          <p className="text-slate-500 mt-2">{data.openJobs} open opportunities are currently available.</p>
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
        {!data.interviewsData.length ? (
          <p className="text-slate-500">No interviews scheduled.</p>
        ) : (
          <div className="space-y-3">
            {data.interviewsData.map((interview) => (
              <div key={interview._id} className="border rounded-xl p-4">
                <p className="font-medium">{interview.application?.job?.title || "Interview"}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(interview.scheduledAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
