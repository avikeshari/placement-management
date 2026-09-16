import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import getErrorMessage from "../../utils/getErrorMessage";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await api.get("/audit-logs");
      setLogs(r.data.logs || []);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to load audit logs."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Loader text="Loading audit logs..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <section>
    <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
    {!logs.length ? <EmptyState title="No audit logs" message="Administrative actions will be logged here." /> : (
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="text-left p-4">Time</th><th className="text-left p-4">Actor</th><th className="text-left p-4">Action</th><th className="text-left p-4">Entity</th></tr></thead>
          <tbody>{logs.map((x) => <tr className="border-t" key={x._id}><td className="p-4">{new Date(x.createdAt).toLocaleString()}</td><td className="p-4">{x.actor?.name || "System"}</td><td className="p-4">{x.action}</td><td className="p-4">{x.entityType} {x.entityId}</td></tr>)}</tbody>
        </table>
      </div>
    )}
  </section>;
}