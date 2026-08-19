import { useCallback, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

const Jobs = () => {
  const [jobs, setJobs] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const response = await api.get("/admin/jobs"); setJobs(response.data.jobs || []); } catch (error) { setError(getErrorMessage(error, "Unable to load jobs.")); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async (job) => { if (!window.confirm(`Delete ${job.title}? Applications and related interviews will also be removed.`)) return; try { await api.delete(`/admin/jobs/${job._id}`); setJobs((items) => items.filter((item) => item._id !== job._id)); toast.success("Job deleted successfully"); } catch (error) { toast.error(getErrorMessage(error, "Unable to delete job.")); } };
  if (loading) return <Loader text="Loading jobs..." />; if (error) return <ErrorState message={error} onRetry={load} />;
  const filtered = jobs.filter((job) => `${job.title} ${job.company?.name || ""} ${job.location || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">Jobs</h1><p className="text-slate-500 mt-2">Review and moderate all placement opportunities.</p></div><div className="relative w-full md:w-80"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs" className="w-full border rounded-lg pl-10 pr-3 py-2.5 bg-white" /></div></div>{!filtered.length ? <EmptyState title="No jobs found" message="There are no matching job postings." /> : <div className="bg-white border rounded-2xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{["Job","Company","Applicants","Salary","Status","Action"].map((h) => <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{filtered.map((job) => <tr key={job._id} className="border-t"><td className="px-5 py-4"><p className="font-semibold">{job.title}</p><p className="text-slate-500">{job.location || "Location not specified"}</p></td><td className="px-5 py-4">{job.company?.name || "—"}</td><td className="px-5 py-4">{job.applicants}</td><td className="px-5 py-4">₹{Number(job.salary || 0).toLocaleString()}</td><td className="px-5 py-4 capitalize">{job.status}</td><td className="px-5 py-4"><button onClick={() => remove(job)} className="text-red-600 inline-flex items-center gap-1"><Trash2 size={15} />Delete</button></td></tr>)}</tbody></table></div>}</section>;
};
export default Jobs;
