import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import getErrorMessage from "../../utils/getErrorMessage";

const Analytics = () => {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const response = await api.get("/admin/analytics"); setData(response.data.analytics); } catch (error) { setError(getErrorMessage(error, "Unable to load analytics.")); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader text="Loading analytics..." />; if (error) return <ErrorState message={error} onRetry={load} />;
  return <section><div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Placement Analytics</h1><p className="text-slate-500 mt-2">Understand application and placement trends.</p></div><div className="grid lg:grid-cols-2 gap-6"><Chart title="Applications by Month" data={data.applicationsByMonth} dataKey="count" nameKey="month" /><Chart title="Placements by Branch" data={data.placementsByBranch} dataKey="count" nameKey="branch" /><Chart title="Placements by Company" data={data.placementsByCompany} dataKey="count" nameKey="company" /></div></section>;
};

const Chart = ({ title, data, dataKey, nameKey }) => <div className="bg-white border rounded-2xl p-5"><h2 className="font-semibold text-lg mb-4">{title}</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={nameKey} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey={dataKey} /></BarChart></ResponsiveContainer></div></div>;

export default Analytics;
