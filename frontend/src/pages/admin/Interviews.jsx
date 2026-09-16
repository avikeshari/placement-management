import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [filter, setFilter] = useState("all");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const response = await api.get("/admin/interviews"); setInterviews(response.data.interviews || []); } catch (error) { setError(getErrorMessage(error, "Unable to load interviews.")); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader text="Loading interviews..." />; if (error) return <ErrorState message={error} onRetry={load} />;
  const now = new Date();
  const visible = interviews.filter((item) => {
    if (filter === "upcoming") return item.status !== "cancelled" && new Date(item.scheduledAt) >= now;
    if (filter === "completed") return item.status === "completed";
    if (filter === "cancelled") return item.status === "cancelled";
    return true;
  });
  return <section><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">Interviews</h1><p className="text-slate-500 mt-2">Central view of upcoming and completed interviews.</p></div><select aria-label="Filter interviews by status" value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-3 py-2.5 bg-white"><option value="all">All interviews</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>{!visible.length ? <EmptyState title="No interviews found" message="No interviews match this filter." /> : <div className="bg-white border rounded-2xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{["Date","Student","Company","Job","Mode","Status","Meeting / Location"].map((h) => <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{visible.map((item) => <tr key={item._id} className="border-t"><td className="px-5 py-4">{new Date(item.scheduledAt).toLocaleString()}</td><td className="px-5 py-4"><p className="font-semibold">{item.student?.name}</p><p className="text-slate-500">{item.student?.email}</p></td><td className="px-5 py-4">{item.company?.name}</td><td className="px-5 py-4">{item.application?.job?.title || "—"}</td><td className="px-5 py-4 capitalize">{item.mode}</td><td className="px-5 py-4 capitalize">{item.status || "—"}</td><td className="px-5 py-4 break-all">{item.meetingUrl ? <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open meeting link</a> : (item.location || "—")}</td></tr>)}</tbody></table></div>}</section>;
};
export default Interviews;
