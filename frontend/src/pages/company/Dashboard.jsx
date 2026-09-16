import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Stat = ({ label, value }) => <div className="bg-white border rounded-2xl p-5"><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>;

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/company/dashboard");
      const dashboard = response.data.dashboard || {};
      setJobs(dashboard.jobs || []);
      setInterviews(dashboard.upcomingInterviews || []);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load company dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const applicants = jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
  const selected = jobs.reduce((sum, job) => sum + (job.selectedCount || 0), 0);
  const openJobs = jobs.filter((job) => job.status === "open").length;

  return (
    <section className="space-y-6">
      <div><h1 className="text-2xl md:text-3xl font-bold">Company Dashboard</h1><p className="text-slate-500 mt-2">Manage recruitment from job posting to selection.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active Jobs" value={openJobs} /><Stat label="Applicants" value={applicants} /><Stat label="Interviews" value={interviews.length} /><Stat label="Selected" value={selected} />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Link to="/company/jobs/new" className="bg-white border rounded-2xl p-6 hover:shadow-md"><h2 className="font-semibold text-lg">Post a Job</h2><p className="text-slate-500 mt-2">Create a new placement opportunity.</p></Link>
        <Link to="/company/jobs" className="bg-white border rounded-2xl p-6 hover:shadow-md"><h2 className="font-semibold text-lg">Manage Jobs</h2><p className="text-slate-500 mt-2">Review listings and applicants.</p></Link>
      </div>
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between mb-4"><h2 className="text-xl font-semibold">Recent Jobs</h2><Link to="/company/jobs" className="text-blue-600 text-sm">View all</Link></div>
        <div className="space-y-3">{jobs.slice(0, 5).map((job) => <div key={job._id} className="border rounded-xl p-4 flex justify-between gap-4"><div><p className="font-medium">{job.title}</p><p className="text-sm text-slate-500">{job.applicantCount || 0} applicants</p></div><span className="capitalize text-sm">{job.status}</span></div>)}</div>
      </div>
    </section>
  );
};

export default Dashboard;
