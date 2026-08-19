import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, Lock, Unlock } from "lucide-react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); const response = await api.get("/jobs/company/my"); setJobs(response.data.jobs || []); }
    catch (error) { setError(getErrorMessage(error, "Unable to load your jobs.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (job) => {
    try {
      const status = job.status === "open" ? "closed" : "open";
      await api.put(`/jobs/${job._id}`, { status });
      setJobs((prev) => prev.map((item) => item._id === job._id ? { ...item, status } : item));
      toast.success(`Job ${status === "open" ? "reopened" : "closed"}`);
    } catch (error) { toast.error(getErrorMessage(error, "Unable to update job status.")); }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Applications and interviews will also be removed.`)) return;
    try { await api.delete(`/jobs/${job._id}`); setJobs((prev) => prev.filter((item) => item._id !== job._id)); toast.success("Job deleted successfully"); }
    catch (error) { toast.error(getErrorMessage(error, "Unable to delete job.")); }
  };

  if (loading) return <Loader text="Loading jobs..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">Manage Jobs</h1><p className="text-slate-500 mt-2">Manage openings, applicants and hiring status.</p></div><Link to="/company/jobs/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg">Post Job</Link></div>
      {!jobs.length ? <EmptyState title="No jobs posted" message="Create your first placement opportunity." /> : <div className="space-y-4">{jobs.map((job) => <article key={job._id} className="bg-white border rounded-2xl p-5"><div className="flex flex-col lg:flex-row lg:justify-between gap-5"><div><h2 className="text-xl font-semibold">{job.title}</h2><p className="text-slate-500">{job.location || "Location not specified"}</p><div className="flex flex-wrap gap-4 text-sm mt-3"><span>{job.applicantCount || 0} applicants</span><span>{job.selectedCount || 0} selected</span><span className="capitalize">{job.status}</span></div></div><div className="flex flex-wrap items-center gap-3"><Link to={`/company/jobs/${job._id}/applications`} className="text-blue-600">Applicants</Link><Link to={`/company/jobs/${job._id}/edit`} className="text-slate-700">Edit</Link><button onClick={() => updateStatus(job)} className="inline-flex items-center gap-1 text-slate-700">{job.status === "open" ? <Lock size={16}/> : <Unlock size={16}/>} {job.status === "open" ? "Close" : "Reopen"}</button><button onClick={() => handleDelete(job)} className="inline-flex items-center gap-1 text-red-600"><Trash2 size={16}/>Delete</button></div></div></article>)}</div>}
    </section>
  );
};
export default Jobs;
