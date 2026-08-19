import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const response = await api.get("/admin/interviews"); setInterviews(response.data.interviews || []); } catch (error) { setError(getErrorMessage(error, "Unable to load interviews.")); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader text="Loading interviews..." />; if (error) return <ErrorState message={error} onRetry={load} />;
  return <section><div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Interviews</h1><p className="text-slate-500 mt-2">Central view of upcoming and completed interviews.</p></div>{!interviews.length ? <EmptyState title="No interviews scheduled" message="Scheduled interviews will appear here." /> : <div className="bg-white border rounded-2xl overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{["Date","Student","Company","Job","Mode","Meeting / Location"].map((h) => <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{interviews.map((item) => <tr key={item._id} className="border-t"><td className="px-5 py-4">{new Date(item.scheduledAt).toLocaleString()}</td><td className="px-5 py-4"><p className="font-semibold">{item.student?.name}</p><p className="text-slate-500">{item.student?.email}</p></td><td className="px-5 py-4">{item.company?.name}</td><td className="px-5 py-4">{item.application?.job?.title || "—"}</td><td className="px-5 py-4 capitalize">{item.mode}</td><td className="px-5 py-4 break-all">{item.meetingUrl || item.location || "—"}</td></tr>)}</tbody></table></div>}</section>;
};
export default Interviews;
